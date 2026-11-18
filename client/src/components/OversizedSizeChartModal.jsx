import SizeChartModal from './SizeChartModal';

export default function OversizedSizeChartModal(props) {
  return <SizeChartModal {...props} initialType={props.initialType || 'oversized'} />;
}
