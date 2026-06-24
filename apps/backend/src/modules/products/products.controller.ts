import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import {
  PRODUCT_IMAGE_FIELD,
  PRODUCT_IMAGE_MAX_SIZE_BYTES,
} from './constants/product.constant';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListResponse } from './dto/product-list.response';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponse } from './dto/product.response';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadedImage } from './interfaces/uploaded-image.interface';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List products with pagination, search, and filters (public)',
  })
  @ApiOkResponse({ type: ProductListResponse })
  findAll(@Query() query: ProductQueryDto): Promise<ProductListResponse> {
    return this.products.findAll(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get a product by slug (public)' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findBySlug(@Param('slug') slug: string): Promise<ProductResponse> {
    return this.products.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor(PRODUCT_IMAGE_FIELD, { limits: { fileSize: PRODUCT_IMAGE_MAX_SIZE_BYTES } }),
  )
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a product (admin only)' })
  @ApiCreatedResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid category/image' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() image?: UploadedImage,
  ): Promise<ProductResponse> {
    return this.products.create(dto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor(PRODUCT_IMAGE_FIELD, { limits: { fileSize: PRODUCT_IMAGE_MAX_SIZE_BYTES } }),
  )
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid category/image' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() image?: UploadedImage,
  ): Promise<ProductResponse> {
    return this.products.update(id, dto, image);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.products.remove(id);
  }
}
