import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelPrice } from '../../database/entities/model-price.entity';

@Injectable()
export class ModelPricesService {
  constructor(
    @InjectRepository(ModelPrice)
    private readonly modelPriceRepository: Repository<ModelPrice>,
  ) {}

  async create(data: {
    name: string;
    provider?: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    isActive?: boolean;
  }) {
    const existing = await this.modelPriceRepository.findOne({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException(`Model with name "${data.name}" already exists`);
    }

    const modelPrice = this.modelPriceRepository.create(data);
    return this.modelPriceRepository.save(modelPrice);
  }

  async findAll() {
    return this.modelPriceRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const modelPrice = await this.modelPriceRepository.findOne({ where: { id } });
    if (!modelPrice) {
      throw new NotFoundException(`ModelPrice with id "${id}" not found`);
    }
    return modelPrice;
  }

  async findByName(name: string) {
    return this.modelPriceRepository.findOne({ where: { name, isActive: true } });
  }

  async update(id: string, data: Partial<{
    name: string;
    provider: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    isActive: boolean;
  }>) {
    await this.findOne(id);
    await this.modelPriceRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.modelPriceRepository.delete(id);
    return { success: true };
  }

  async seedInitialModels() {
    const models = [
      {
        name: 'gemini-2.0-flash-exp',
        provider: 'google',
        inputPricePer1M: 0,
        outputPricePer1M: 0,
        isActive: true,
      },
      {
        name: 'gemini-1.5-pro',
        provider: 'google',
        inputPricePer1M: 1.25,
        outputPricePer1M: 5.0,
        isActive: true,
      },
      {
        name: 'gemini-1.5-flash',
        provider: 'google',
        inputPricePer1M: 0.075,
        outputPricePer1M: 0.3,
        isActive: true,
      },
      {
        name: 'gemini-2.5-flash-lite',
        provider: 'google',
        inputPricePer1M: 0.1,
        outputPricePer1M: 0.4,
        isActive: true,
      },
      {
        name: 'gemini-2.5-flash-lite-preview',
        provider: 'google',
        inputPricePer1M: 0.1,
        outputPricePer1M: 0.4,
        isActive: true,
      },
    ];

    const results = [];
    for (const modelData of models) {
      const existing = await this.modelPriceRepository.findOne({ where: { name: modelData.name } });
      if (!existing) {
        const modelPrice = this.modelPriceRepository.create(modelData);
        results.push(await this.modelPriceRepository.save(modelPrice));
      }
    }
    return results;
  }
}