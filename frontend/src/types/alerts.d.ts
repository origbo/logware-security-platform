/**
 * Type declarations for Alert-related interfaces
 */

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  sourceId?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  category?: string;
  relatedResources?: {
    type: string;
    id: string;
    name: string;
  }[];
  metadata?: Record<string, any>;
}
