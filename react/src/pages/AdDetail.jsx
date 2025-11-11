import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Space, Button, message, Popconfirm } from 'antd';
import { getAd, deleteAd, moderateAd } from '../api/ads';
import { getMe } from '../api/members';

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = React.useState(null);
  const [me, setMe] = React.useState(null);
  const [error, setError] = React.useState('');

  const load = async () => {
    try {
      setError('');
      const [adData, meData] = await Promise.allSettled([getAd(id), getMe()]);
      if (adData.status === 'fulfilled') setAd(adData.value);
      if (meData.status === 'fulfilled') setMe(meData.value);
    } catch (e) {
      setError('Ошибка загрузки');
    }
  };

  React.useEffect(() => {
    load();
  }, [id]);

  const canEdit = me && ad && me.id === ad.owner.id;
  const canModerate = me && me.is_moderator;

  const onDelete = async () => {
    try {
      await deleteAd(id);
      message.success('Удалено');
      navigate('/my');
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка удаления');
    }
  };

  const onApprove = async () => {
    try {
      await moderateAd(id, 'approved');
      message.success('Одобрено');
      load();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка');
    }
  };
  const onReject = async () => {
    try {
      await moderateAd(id, 'rejected');
      message.success('Отклонено');
      load();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Ошибка');
    }
  };

  if (!ad) return <div data-easytag="id3-react/src/pages/AdDetail.jsx">Загрузка...</div>;
  return (
    <div data-easytag="id3-react/src/pages/AdDetail.jsx">
      {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      <Card title={ad.title}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>Цена: {ad.price}</div>
          <div>Описание: {ad.description}</div>
          <div>Контакты: {ad.contacts}</div>
          <div>Статус: {ad.status}</div>
          <div>Автор: {ad.owner?.username}</div>
          <Space>
            {canEdit && (
              <Popconfirm title="Удалить объявление?" onConfirm={onDelete} okText="Да" cancelText="Нет">
                <Button danger>Удалить</Button>
              </Popconfirm>
            )}
            {canModerate && ad.status !== 'approved' && (
              <Button onClick={onApprove} type="primary">
                Одобрить
              </Button>
            )}
            {canModerate && ad.status !== 'rejected' && (
              <Button onClick={onReject} danger>
                Отклонить
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </div>
  );
}
