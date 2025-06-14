import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`);
    }

    return {
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const { name, description, price, imageUrl, tags } = createCoffeeDto;

    return this.prisma.coffee.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        tags: {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    await this.prisma.coffee.deleteMany({
      where: { coffeeId: id },
    });

    // Atualizar os dados do café
    return this.prisma.coffee.update({
      where: { id },
      data: [], // seu dados atualziados iserir aqui
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
  if (!coffee) {
    throw new NotFoundException(`Coffee with ID ${id} not found`);
  }

  // remover os relacionamentos antes de deletar
  await this.prisma.coffee.deleteMany({
    where: { coffeeId: id },
  });

  await this.prisma.coffee.delete({ where: { id } });
  }

  async searchCoffees(params: {
    start_date?: Date;
    end_date?: Date;
    name?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { start_date, end_date, name, tags, limit = 10, offset = 0 } = params;

    // Construir o filtro

    // Filtro por data

    // Filtro por nome

    // Filtro por tags

    // Buscar os cafés com paginação

    // Formatar a resposta
    return {
      data: [],
      pagination: {
        total: [],
        limit,
        offset,
        hasMore: offset,
      },
    };
  }



} 