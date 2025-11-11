import React from 'react';
import { myAds, updateAd, deleteAd } from '../api/ads';
import { Card, List, Space, Button, Modal, Form, Input, InputNumber, Popconfirm, message } from 'antd';
import { Link } from 'react-router-dom';

export default function MyAds() {
  const [data, setData] = React.useState([]);
  const [editing, setEditing] = React.useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const res = await myAds({});
      setData(res.results || []);
    } catch (e) {}
  };
  React.useEffect(() => {
    load();
  }, []);

  const startEdit = (item) => {
    setEditing(item);
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      price: Number(item.price),
      contacts: item.contacts,
    });
  };
  const save = async () => {
    const values = await form.validateFields();
    try {
      await updateAd(editing.id, values);
      message.success('Сохранено, ожидает модерации');
      setEditing(null);
      load();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка');
    }
  };
  const remove = async (id) => {
    try {
      await deleteAd(id);
      message.success('Удалено');
      load();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка');
    }
  };

  return (
    <div data-easytag="id8-react/src/pages/MyAds.jsx">
      <Card title="Мои объявления">
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="edit" onClick={() => startEdit(item)}>
                  Редактировать
                </Button>,
                <Popconfirm key="del" title="Удалить?" onConfirm={() => remove(item.id)}>
                  <Button danger>Удалить</Button>
                </Popconfirm>,
                <Link key="view" to={`/ad/${item.id}`}>
                  Открыть
                </Link>,
              ]}
            >
              <List.Item.Meta title={`${item.title} — ${item.price}`} description={`Статус: ${item.status}`} />
            </List.Item>
          )}
        />
      </Card>

      <Modal open={!!editing} onCancel={() => setEditing(null)} onOk={save} title="Редактирование объявления">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contacts" label="Контакты" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
