import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  ExpenseQueryDto,
  SummaryQueryDto,
  UpdateExpenseDto,
} from './dto/expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  findAll(@CurrentUserId() userId: number, @Query() query: ExpenseQueryDto) {
    return this.expenses.findAll(userId, query);
  }

  // Declared before ':id' so "summary" is not parsed as an id.
  @Get('summary')
  summary(@CurrentUserId() userId: number, @Query() query: SummaryQueryDto) {
    return this.expenses.summary(userId, query.month);
  }

  @Get(':id')
  findOne(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.expenses.findOne(userId, id);
  }

  @Post()
  create(@CurrentUserId() userId: number, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.expenses.remove(userId, id);
  }
}
