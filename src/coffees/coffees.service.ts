import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { CoffeeResponseDto } from './dto/coffee-response.dto';

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

    return coffees.map(coffee => CoffeeResponseDto.fromEntity({
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

    return CoffeeResponseDto.fromEntity({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    });
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const { name, description, price, imageUrl, tags } = createCoffeeDto;

    const coffee = await this.prisma.coffee.create({
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

    return CoffeeResponseDto.fromEntity({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    });
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this.prisma.coffee.update({
      where: { id },
      data: updateCoffeeDto,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return CoffeeResponseDto.fromEntity({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    });
  }

  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`);
    }

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
    const where: any = {};

    // Filtro por data
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt.gte = start_date;
      }
      if (end_date) {
        where.createdAt.lte = end_date;
      }
    }

    // Filtro por nome
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    // Filtro por tags
    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags,
            },
          },
        },
      };
    }

    // Buscar os cafés com paginação
    const [coffees, total] = await Promise.all([
      this.prisma.coffee.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.coffee.count({ where }),
    ]);

    // Formatar a resposta
    return {
      data: coffees.map(coffee => CoffeeResponseDto.fromEntity({
        ...coffee,
        tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
} 