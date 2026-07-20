import { Typography } from 'antd';
interface ElipsisProps {
    title: string
}
export const ShowElipsis = ({ title }: ElipsisProps) => {
    const { Text } = Typography;
    return (
        <Text style={{ width: 150 }} ellipsis={{ tooltip: title }}>
            {title}
        </Text>
    )
}