import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponse } from './dto/cart.response';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalJwtAccessGuard } from './guards/optional-jwt-access.guard';
import { CartIdentity } from './interfaces/cart-identity.interface';
import { CartCookieService } from './services/cart-cookie.service';

@ApiTags('cart')
@Controller('cart')
// Optional auth: identifies the user when an access cookie is present, otherwise
// the request proceeds as an anonymous guest.
@UseGuards(OptionalJwtAccessGuard)
// @Public() keeps these routes open to guests if a global auth guard is added later.
@Public()
export class CartController {
  constructor(
    private readonly cart: CartService,
    private readonly cookies: CartCookieService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the current cart (guest or authenticated)' })
  @ApiOkResponse({ type: CartResponse })
  async getCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponse> {
    const identity = await this.resolveIdentity(user, req, res);
    return this.cart.getCart(identity);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart (increments if present)' })
  @ApiOkResponse({ type: CartResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiConflictResponse({ description: 'Product is not available' })
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponse> {
    const identity = await this.resolveIdentity(user, req, res);
    return this.cart.addItem(identity, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Set the quantity of a cart item' })
  @ApiOkResponse({ type: CartResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponse> {
    const identity = await this.resolveIdentity(user, req, res);
    return this.cart.updateItem(identity, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove a single item from the cart' })
  @ApiOkResponse({ type: CartResponse })
  @ApiNotFoundResponse({ description: 'Cart item not found' })
  async removeItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponse> {
    const identity = await this.resolveIdentity(user, req, res);
    return this.cart.removeItem(identity, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Empty the cart' })
  @ApiOkResponse({ type: CartResponse })
  async clearCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponse> {
    const identity = await this.resolveIdentity(user, req, res);
    return this.cart.clearCart(identity);
  }

  /**
   * Resolves who owns this request's cart and applies cookie side-effects:
   * - authenticated + lingering guest cookie → merge guest cart, then clear it
   * - authenticated → user identity
   * - guest without a token → generate one and set the cookie
   */
  private async resolveIdentity(
    user: AuthenticatedUser | undefined,
    req: Request,
    res: Response,
  ): Promise<CartIdentity> {
    const guestToken = this.cookies.read(req);

    if (user) {
      if (guestToken) {
        await this.cart.mergeGuestCartIntoUser(user.id, guestToken);
        this.cookies.clear(res);
      }
      return { userId: user.id };
    }

    if (guestToken) {
      return { guestToken };
    }

    const newToken = this.cookies.generateToken();
    this.cookies.set(res, newToken);
    return { guestToken: newToken };
  }
}
