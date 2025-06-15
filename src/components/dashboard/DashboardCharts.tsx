
import OrderDistributionChart from './OrderDistributionChart';
import ReadyOrdersTrendChart from './ReadyOrdersTrendChart';

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <OrderDistributionChart />
      </div>
      <div className="lg:col-span-3">
        <ReadyOrdersTrendChart />
      </div>
    </div>
  );
};

export default DashboardCharts;
