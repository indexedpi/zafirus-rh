import { Controller, Get, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('cases/:id/tasks')
  findByCaseId(@Param('id') caseId: string) {
    return this.tasksService.findByCaseId(caseId);
  }
}
