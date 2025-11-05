import { WidgetType, Plan } from '@prisma/client';

export class CreateTenantDto {
  name: string;
  subdomain: string;
  widgetType: WidgetType;
  plan?: Plan;
  config?: any;
}
