import React from 'react';
import { Card, Form, Input, Button, message, List } from 'antd';
import { getMe, updateMe } from '../api/members';
import { listAds } from '../api/ads';
import { login, register } from '../api/auth';

export default function Profile() {
  const [me, setMe] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [ads, setAds] = React.useState([]);
  const [error, setError] = React.useState('');

  const loadMe = async () => {
    try {
      const data = await getMe();
      setMe(data);
    } catch (e) {
      setMe(null);
    }
  };
  const loadPending = async () => {
    try {
      const data = await listAds({});
      setAds((data.results || []).filter((a) => a.status === 'pending'));
    } catch (e) {}
  };

  React.useEffect(() => {
    loadMe();
  }, []);
  React.useEffect(() => {
    if (me?.is_moderator) loadPending();
  }, [me]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const updated = await updateMe(values);
      setMe(updated);
      message.success('Профиль обновлен');
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  if (!me) {
    return (
      <div data-easytag="id5-react/src/pages/Profile.jsx">
        <Card title="Личный кабинет">
          <AuthBlock />
        </Card>
      </div>
    );
  }

  return (
    <div data-easytag="id5-react/src/pages/Profile.jsx">
      <Card title="Личный кабинет">
        <p>Email: {me.email}</p>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ username: me.username }}>
          <Form.Item name="username" label="Имя пользователя" rules={[{ required: true, message: 'Укажите имя' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Новый пароль">
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={logout}>
              Выйти
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {me.is_moderator && (
        <Card title="Ожидают модерации" style={{ marginTop: 16 }}>
          <List dataSource={ads} renderItem={(item) => <List.Item>{item.title}</List.Item>} />
        </Card>
      )}
    </div>
  );
}

function AuthBlock() {
  const [mode, setMode] = React.useState('login');
  return <div>{mode === 'login' ? <LoginForm onSwitch={() => setMode('register')} /> : <RegisterForm onSwitch={() => setMode('login')} />}</div>;
}

function LoginForm({ onSwitch }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await login(values);
      localStorage.setItem('access_token', data.access);
      message.success('Успешный вход');
      window.location.href = '/profile';
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish} data-easytag="id6-react/src/pages/Profile.jsx#LoginForm">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Войти
          </Button>
          <Button type="link" onClick={onSwitch}>
            Регистрация
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Регистрация успешна, войдите');
      onSwitch();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish} data-easytag="id7-react/src/pages/Profile.jsx#RegisterForm">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="username" label="Имя пользователя" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 6 }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Зарегистрироваться
          </Button>
          <Button type="link" onClick={onSwitch}>
            У меня уже есть аккаунт
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
