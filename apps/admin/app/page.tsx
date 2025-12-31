'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@devstore/ui/Card';
import { Button } from '@devstore/ui/Button';
import { Badge } from '@devstore/ui/Badge';
import { formatPrice, formatDate } from '@devstore/utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    conversion: 0,
    averageOrder: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=5'),
      ]);
      
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      if (ordersData.success) {
        setRecentOrders(ordersData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.revenue),
      icon: DollarSign,
      change: '+12.5%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: ShoppingCart,
      change: '+8.2%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Customers',
      value: stats.customers,
      icon: Users,
      change: '+15.3%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Products',
      value: stats.products,
      icon: Package,
      change: '+5.1%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.color} mt-1`}>
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-400">
              Revenue chart will appear here
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Orders
              <Badge variant="outline">New</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(order.amountCents)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        order.status === 'PAID' ? 'default' :
                        order.status === 'PROCESSING' ? 'secondary' :
                        'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(order.createdAt, 'short')}
                    </p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.conversion}%
              </div>
              <p className="text-sm text-gray-600 mt-2">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(stats.averageOrder)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Average Order Value</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24h</div>
              <p className="text-sm text-gray-600 mt-2">Avg. Delivery Time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">98%</div>
              <p className="text-sm text-gray-600 mt-2">Satisfaction Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}