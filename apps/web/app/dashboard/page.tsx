'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  FileText,
  Download,
  MessageSquare,
  Settings,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@devstore/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devstore/ui/Tabs';
import { Button } from '@devstore/ui/Button';
import { Badge } from '@devstore/ui/Badge';
import { formatPrice, formatDate, formatFileSize } from '@devstore/utils/formatters';
import { useOrders } from '@/hooks/useOrders';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const { orders, loading, refetch } = useOrders({ enabled: true });
  
  const activeServices = orders?.filter(
    order => order.serviceStatus && 
    ['AWAITING_BRIEF', 'BRIEF_SUBMITTED', 'IN_PROGRESS'].includes(order.serviceStatus)
  ) || [];

  const stats = {
    totalOrders: orders?.length || 0,
    activeServices: activeServices.length,
    completedOrders: orders?.filter(o => o.status === 'COMPLETED').length || 0,
    totalSpent: orders?.reduce((sum, order) => sum + order.amountCents, 0) || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your orders, services, and downloads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold mt-2">{stats.activeServices}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold mt-2">{stats.completedOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold mt-2">
                  {formatPrice(stats.totalSpent)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {orders?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <Button className="mt-4" onClick={() => window.location.href = '/products'}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            Order #{order.orderNumber}
                          </h3>
                          <Badge
                            variant={
                              order.status === 'PAID' ? 'default' :
                              order.status === 'PROCESSING' ? 'secondary' :
                              order.status === 'COMPLETED' ? 'outline' :
                              'destructive'
                            }
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.createdAt, 'long')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(order.amountCents)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium">{item.product.title}</span>
                              <span className="text-gray-500 ml-2">
                                ×{item.quantity}
                              </span>
                            </div>
                            <span>{formatPrice(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services">
          {activeServices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active services</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeServices.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {order.items?.[0]?.product.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order #{order.orderNumber}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {order.serviceStatus?.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>
                          {order.serviceStatus === 'AWAITING_BRIEF' ? '0%' :
                           order.serviceStatus === 'IN_PROGRESS' ? '50%' :
                           order.serviceStatus === 'READY_FOR_REVIEW' ? '90%' : '100%'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: order.serviceStatus === 'AWAITING_BRIEF' ? '10%' :
                                   order.serviceStatus === 'IN_PROGRESS' ? '50%' :
                                   order.serviceStatus === 'READY_FOR_REVIEW' ? '90%' : '100%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {order.serviceStatus === 'AWAITING_BRIEF' && (
                        <Button
                          className="flex-1"
                          onClick={() => window.location.href = `/dashboard/services/${order.id}/brief`}
                        >
                          Submit Brief
                        </Button>
                      )}
                      
                      {order.serviceStatus === 'READY_FOR_REVIEW' && (
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => window.location.href = `/dashboard/services/${order.id}/review`}
                        >
                          Review Work
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = `/dashboard/services/${order.id}/messages`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Your Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.flatMap(order =>
                  order.deliverables?.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{deliverable.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>
                              {deliverable.fileSize && formatFileSize(deliverable.fileSize)}
                            </span>
                            <span>•</span>
                            <span>
                              Downloaded {deliverable.downloadCount} times
                            </span>
                            {deliverable.expiresAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Expires {formatDate(deliverable.expiresAt, 'short')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(deliverable.fileUrl, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}