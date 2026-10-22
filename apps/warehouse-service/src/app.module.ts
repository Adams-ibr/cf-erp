import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { WarehousesController } from './warehouses/warehouses.controller';
import { LocationsController } from './locations/locations.controller';
import { InventoryController } from './inventory/inventory.controller';
import { StockMovementsController } from './stock-movements/stock-movements.controller';
import { InventoryCountsController } from './inventory-counts/inventory-counts.controller';
import { ReplenishmentController } from './replenishment/replenishment.controller';
import { ValuationController } from './valuation/valuation.controller';
import { WarehousesService } from './warehouses/warehouses.service';
import { LocationsService } from './locations/locations.service';
import { InventoryService } from './inventory/inventory.service';
import { StockMovementsService } from './stock-movements/stock-movements.service';
import { InventoryCountsService } from './inventory-counts/inventory-counts.service';
import { ReplenishmentService } from './replenishment/replenishment.service';
import { ValuationService } from './valuation/valuation.service';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: ['.env', `.env.${env.nodeEnv}`],
    }),
    ThrottlerModule.forRoot([{
      ttl: env.rateLimit.windowMs,
      limit: env.rateLimit.maxRequests,
    }]),
    TerminusModule,
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    WarehousesController,
    LocationsController,
    InventoryController,
    StockMovementsController,
    InventoryCountsController,
    ReplenishmentController,
    ValuationController,
    HealthController,
  ],
  providers: [
    WarehousesService,
    LocationsService,
    InventoryService,
    StockMovementsService,
    InventoryCountsService,
    ReplenishmentService,
    ValuationService,
  ],
})
export class AppModule {}