import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Employee> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return emp;
  }

  async create(data: Partial<Employee>): Promise<Employee> {
    const employee = this.repo.create(data);
    return this.repo.save(employee);
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const emp = await this.findOne(id);
    Object.assign(emp, data);
    return this.repo.save(emp);
  }
}
