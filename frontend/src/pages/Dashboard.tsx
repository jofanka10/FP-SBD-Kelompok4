import React, { useEffect, useState } from 'react';
import { Users, Heart, CreditCard, UserCheck, TrendingUp, DollarSign } from 'lucide-react';
import { userAPI, donationAPI, transactionAPI, aidRecipientAPI } from '../services/api';

interface Stats {
  totalUsers: number;
  totalDonations: number;
  totalTransactions: number;
  totalAidRecipients: number;
  totalDonationAmount: number;
  successfulTransactions: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDonations: 0,
    totalTransactions: 0,
    totalAidRecipients: 0,
    totalDonationAmount: 0,
    successfulTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, donationsRes, transactionsRes, aidRecipientsRes] = await Promise.all([
        userAPI.getAll(),
        donationAPI.getAll(),
        transactionAPI.getAll(),
        aidRecipientAPI.getAll(),
      ]);

      const donations = donationsRes.data;
      const transactions = transactionsRes.data;

      setStats({
        totalUsers: usersRes.data.length,
        totalDonations: donations.length,
        totalTransactions: transactions.length,
        totalAidRecipients: aidRecipientsRes.data.length,
        totalDonationAmount: donations.reduce((sum: number, donation: any) => sum + donation.amount, 0),
        successfulTransactions: transactions.filter((t: any) => t.transaction_status === 'Sukses').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '',
    },
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      icon: Heart,
      color: 'bg-green-500',
      change: '',
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'bg-purple-500',
      change: '',
    },
    {
      title: 'Aid Recipients',
      value: stats.totalAidRecipients,
      icon: UserCheck,
      color: 'bg-orange-500',
      change: '',
    },
    {
      title: 'Total Donation Amount',
      value: `Rp ${stats.totalDonationAmount.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '',
    },
    {
      title: 'Successful Transactions',
      value: stats.successfulTransactions,
      icon: TrendingUp,
      color: 'bg-cyan-500',
      change: '',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('id-ID')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {card.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New donation received</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-sm text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Transaction completed</p>
                  <p className="text-sm text-gray-500">10 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add User</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">New Donation</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UserCheck className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Recipient</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;