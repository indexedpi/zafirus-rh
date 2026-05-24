import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTask } from './onboarding-task.entity';
import { TaskStatus, TaskType } from '../common/enums';

/** Task label map (Spanish) */
const TASK_LABELS: Record<TaskType, string> = {
  [TaskType.CREATE_GOOGLE_USER]: 'Crear usuario de Google Workspace',
  [TaskType.ADD_GOOGLE_GROUPS]: 'Agregar a grupos',
  [TaskType.CONFIGURE_GMAIL_SIGNATURE]: 'Configurar firma de Gmail',
  [TaskType.SEND_WELCOME_EMAIL]: 'Enviar email de bienvenida',
  [TaskType.ANNOUNCE_IN_GROUPS]: 'Anunciar en grupos',
  [TaskType.POST_INTERNAL_ANNOUNCEMENT]: 'Publicar anuncio interno',
  [TaskType.REQUEST_DEVICE]: 'Solicitar equipo',
  [TaskType.NOTIFY_ADMINISTRATION]: 'Notificar a Administración',
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(OnboardingTask)
    private readonly repo: Repository<OnboardingTask>,
  ) {}

  async findByCaseId(caseId: string): Promise<OnboardingTask[]> {
    return this.repo.find({
      where: { caseId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OnboardingTask> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  /**
   * Create the standard activation tasks for a case.
   * No real external APIs are called — these are mock task rows.
   */
  async createActivationTasks(caseId: string): Promise<OnboardingTask[]> {
    const types: TaskType[] = [
      TaskType.CREATE_GOOGLE_USER,
      TaskType.ADD_GOOGLE_GROUPS,
      TaskType.CONFIGURE_GMAIL_SIGNATURE,
      TaskType.SEND_WELCOME_EMAIL,
      TaskType.REQUEST_DEVICE,
    ];

    const tasks = types.map((type) =>
      this.repo.create({
        caseId,
        type,
        label: TASK_LABELS[type],
        status: TaskStatus.PENDING,
        attempts: 0,
      }),
    );

    return this.repo.save(tasks);
  }

  async updateStatus(
    taskId: string,
    status: TaskStatus,
    output?: Record<string, unknown>,
  ): Promise<OnboardingTask> {
    const task = await this.findOne(taskId);
    task.status = status;
    task.attempts += 1;

    if (status === TaskStatus.RUNNING) {
      task.startedAt = new Date();
    }
    if (status === TaskStatus.SUCCESS || status === TaskStatus.SKIPPED) {
      task.completedAt = new Date();
    }
    if (status === TaskStatus.FAILED) {
      task.failedAt = new Date();
    }
    if (output) {
      task.output = output;
    }

    return this.repo.save(task);
  }
}
