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


    </div>
  );
};

export default Dashboard;