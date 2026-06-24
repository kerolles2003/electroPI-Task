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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import { CategoriesService } from './categories.service';
import { CategoryResponse } from './dto/category.response';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all categories (public)' })
  @ApiOkResponse({ type: [CategoryResponse] })
  findAll(): Promise<CategoryResponse[]> {
    return this.categories.findAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get a category by slug (public)' })
  @ApiOkResponse({ type: CategoryResponse })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findBySlug(@Param('slug') slug: string): Promise<CategoryResponse> {
    return this.categories.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a category (admin only)' })
  @ApiCreatedResponse({ type: CategoryResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponse> {
    return this.categories.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiOkResponse({ type: CategoryResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiConflictResponse({ description: 'Category still has products' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categories.remove(id);
  }
}
