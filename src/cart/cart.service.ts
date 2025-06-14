import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    // Se userId for fornecido, buscar carrinho existente ou criar novo
    if (userId) {
      const existingCart = await this.prisma.cart.findFirst({
        where: { userId },
        include: { items: { include: { coffee: true } } },
      });

      if (existingCart) {
        return existingCart;
      }
    }

    // Criar novo carrinho
    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        status: CartStatus.AGUARDANDO_PAGAMENTO,
        statusPayment: PaymentStatus.PENDENTE,
      },
      include: { items: { include: { coffee: true } } },
    });
  }

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { coffee: true } } },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return cart;
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    // Validar quantidade
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }
    if (quantity > 5) {
      throw new BadRequestException('Quantity cannot exceed 5');
    }

    // Verificar se o café existe
    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${coffeeId} not found`);
    }

    // Verificar se o carrinho existe
    const cart = await this.getCart(cartId);

    // Verificar se o item já existe no carrinho
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        coffeeId,
      },
    });

    if (existingItem) {
      // Atualizar quantidade se o item já existe
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > 5) {
        throw new BadRequestException('Total quantity cannot exceed 5');
      }

      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { coffee: true },
      });

      return {
        ...updatedItem,
        subtotal: Number(updatedItem.quantity) * Number(updatedItem.unitPrice),
      };
    }

    // Criar novo item no carrinho
    const newItem = await this.prisma.cartItem.create({
      data: {
        cartId,
        coffeeId,
        quantity,
        unitPrice: coffee.price,
      },
      include: { coffee: true },
    });

    return {
      ...newItem,
      subtotal: Number(newItem.quantity) * Number(newItem.unitPrice),
    };
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    const { quantity } = updateItemDto;

    // Validar quantidade
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }
    if (quantity > 5) {
      throw new BadRequestException('Quantity cannot exceed 5');
    }

    // Verificar se o item existe no carrinho
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart ${cartId}`);
    }

    // Atualizar quantidade do item
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { coffee: true },
    });

    return {
      ...updatedItem,
      subtotal: Number(updatedItem.quantity) * Number(updatedItem.unitPrice),
    };
  }

  async removeItem(cartId: string, itemId: string) {
    // Verificar se o item existe no carrinho
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart ${cartId}`);
    }

    // Remover o item do carrinho
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }
} 