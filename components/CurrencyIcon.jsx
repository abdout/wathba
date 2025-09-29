import OptimizedImage from '@/components/OptimizedImage'; // Using simplified version
import { dirham } from '@/lib/imagekit-urls';

const CurrencyIcon = ({ className = "w-4 h-4 inline-block", width = 16, height = 16 }) => {
  return (
    <OptimizedImage
      src={dirham}
      alt="AED"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

export default CurrencyIcon;