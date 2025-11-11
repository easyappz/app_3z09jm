import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import Home from './pages/Home';
import AdDetail from './pages/AdDetail';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import MyAds from './pages/MyAds';
import NotFound from './pages/NotFound';
import './App.css';

const { Header, Content, Footer } = Layout;

function AppShell() {
  const navigate = useNavigate();
  return (
    <Layout data-easytag="id1-react/src/App.js">
      <Header>
        <div
          className="logo"
          style={{ color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Объявления
        </div>
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="home"><Link to="/">Главная</Link></Menu.Item>
          <Menu.Item key="create"><Link to="/create">Создать объявление</Link></Menu.Item>
          <Menu.Item key="my"><Link to="/my">Мои объявления</Link></Menu.Item>
          <Menu.Item key="profile"><Link to="/profile">Личный кабинет</Link></Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ad/:id" element={<AdDetail />} />
          <Route path="/create" element={<CreateAd />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my" element={<MyAds />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Сайт объявлений ©2025</Footer>
    </Layout>
  );
}

export default function App() {
  React.useEffect(() => {
    try {
      if (window && typeof window.handleRoutes === 'function') {
        window.handleRoutes(["/", "/ad/:id", "/create", "/profile", "/my", "/*"]);
      }
    } catch (e) {}
  }, []);
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
