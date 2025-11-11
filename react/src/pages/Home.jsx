import React from 'react';
import { Input, Button, Row, Col, Card, Pagination, Space, Select } from 'antd';
import { listAds } from '../api/ads';
import { Link } from 'react-router-dom';

export default function Home() {
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [ordering, setOrdering] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = async (p = page, ps = pageSize) => {
    setLoading(true);
    setError('');
    try {
      const data = await listAds({
        q,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        ordering: ordering || undefined,
        page: p,
        page_size: ps,
      });
      setItems(data.results || []);
      setCount(data.count || 0);
      setPage(p);
      setPageSize(ps);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-easytag="id2-react/src/pages/Home.jsx">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={12}>
          <Col span={8}>
            <Input placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
          </Col>
          <Col span={4}>
            <Input placeholder="Мин. цена" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </Col>
          <Col span={4}>
            <Input placeholder="Макс. цена" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </Col>
          <Col span={4}>
            <Select value={ordering} onChange={setOrdering} style={{ width: '100%' }} placeholder="Сортировка">
              <Select.Option value="">Без сортировки</Select.Option>
              <Select.Option value="price">Цена ↑</Select.Option>
              <Select.Option value="-price">Цена ↓</Select.Option>
              <Select.Option value="created_at">Сначала старые</Select.Option>
              <Select.Option value="-created_at">Сначала новые</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={() => load(1, pageSize)} loading={loading}>
              Найти
            </Button>
          </Col>
        </Row>
        {error ? <div style={{ color: 'red' }}>{error}</div> : null}
        <Row gutter={[16, 16]}>
          {items.map((ad) => (
            <Col key={ad.id} xs={24} sm={12} md={8} lg={6}>
              <Card title={<Link to={`/ad/${ad.id}`}>{ad.title}</Link>}>
                <div>Цена: {ad.price}</div>
                <div>Статус: {ad.status}</div>
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={count}
          onChange={(p, ps) => load(p, ps)}
          showSizeChanger
          onShowSizeChange={(p, ps) => load(p, ps)}
        />
      </Space>
    </div>
  );
}
