import { WidgetType, Plan, TenantStatus, DeploymentStatus } from '@prisma/client';

export class UpdateTenantDto {
  name?: string;
  subdomain?: string;
  widgetType?: WidgetType;
  plan?: Plan;
  status?: TenantStatus;
  deploymentStatus?: DeploymentStatus;
  deploymentUrl?: string;
  railwayServiceId?: string;
  config?: any;
}
