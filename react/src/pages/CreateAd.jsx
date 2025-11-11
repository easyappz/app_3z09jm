import React from 'react';
import { Form, Input, InputNumber, Button, message, Card } from 'antd';
import { createAd } from '../api/ads';
import { useNavigate } from 'react-router-dom';

export default function CreateAd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const ad = await createAd({
        title: values.title,
        description: values.description,
        price: values.price,
        contacts: values.contacts,
      });
      message.success('Объявление создано и отправлено на модерацию');
      navigate(`/ad/${ad.id}`);
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div data-easytag="id4-react/src/pages/CreateAd.jsx">
      <Card title="Создание объявления">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Заголовок" rules={[{ required: true, message: 'Укажите заголовок' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Укажите описание' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true, message: 'Укажите цену' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contacts" label="Контакты" rules={[{ required: true, message: 'Укажите контакты' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Создать
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
