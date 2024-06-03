import React from "react"
import Home from '../pages/Home/home';
import Login from '../pages/Login/login';
import PublicRoute from '../components/PublicRoute';
import PrivateRoute from '../components/PrivateRoute';
import NotFound from '../components/NotFound/notFound';
import Footer from '../components/layout/Footer/footer';
import Header from '../components/layout/Header/header';
import ProductDetail from '../pages/Product/productDetail/productDetail'
import Profile from '../pages/Profile/profile';
import Contact from '../pages/Contact/contact';

import { Layout } from 'antd';
import { withRouter } from "react-router";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Register from "../pages/Register/register";
import ProductList from "../pages/Product/productList/productList";
import News from "../pages/News/news";
import NewsDetail from "../pages/NewsDetai/newsDetai";
import ResetPassword from "../pages/ResetPassword/resetPassword";
import RoomManagement from "../pages/RoomManagement/roomManagement";
import Maps from "../pages/Maps/maps";
import RoomTypeManagement from "../pages/RoomTypeManagement/roomTypeManagement";
import BookMarkManagement from "../pages/BookMarkManagement/bookMarkManagement";
import ChangePassword from "../pages/ChangePassword/changePassword";
import ProfileRoom from "../pages/Profile-Room/profileRoom";

const RouterURL = withRouter(({ location }) => {

    const PrivateContainer = () => (
        <div>
            <Layout style={{ minHeight: '100vh' }}>
                <Layout style={{ display: 'flex' }}>
                    <Header />
                    <Route exact path="/home">
                        <Home />
                    </Route>
                    <PrivateRoute exact path="/event-detail/:id">
                        <ProductDetail />
                    </PrivateRoute>
                    <PrivateRoute exact path="/profile">
                        <Profile />
                    </PrivateRoute>
                    <PrivateRoute exact path="/room-management">
                        <RoomManagement />
                    </PrivateRoute>
                    <PrivateRoute exact path="/product-list/:id">
                        <ProductList />
                    </PrivateRoute>
                    <PrivateRoute exact path="/room-type-management">
                        <RoomTypeManagement />
                    </PrivateRoute>
                    <PrivateRoute exact path="/bookMark-management">
                        <BookMarkManagement />
                    </PrivateRoute>
                    <PrivateRoute exact path="/change-password/:id">
                        <ChangePassword />
                    </PrivateRoute>
                    <Layout>
                        <Footer />
                    </Layout>
                </Layout>
            </Layout>
        </div>
    )

    const PublicContainer = () => (
        <div>
            <Layout style={{ minHeight: '100vh' }}>
                <Layout style={{ display: 'flex' }}>
                    <Header />
                    <Route exact path="/">
                        <Home />
                    </Route>
                    <Route exact path="/product-detail/:id">
                        <ProductDetail />
                    </Route>
                    <Route exact path="/contact">
                        <Contact />
                    </Route>
                    <Route exact path="/news">
                        <News />
                    </Route>
                    <Route exact path="/maps">
                        <Maps />
                    </Route>
                    <Route exact path="/news/:id">
                        <NewsDetail />
                    </Route>
                    <Route exact path="/product-list/:id">
                        <ProductList />
                    </Route>
                    <Route exact path="/reset-password/:id">
                        <ResetPassword />
                    </Route>
                    <Route exact path="/profile-rooms/:id">
                        <ProfileRoom />
                    </Route>
                   
                    <Layout>
                        <Footer />
                    </Layout>
                </Layout>
            </Layout>
        </div>
    )

    const LoginContainer = () => (
        <div>
            <Layout style={{ minHeight: '100vh' }}>
                <Layout style={{ display: 'flex' }}>
                    <PublicRoute exact path="/">
                        <Login />
                    </PublicRoute>
                    <PublicRoute exact path="/login">
                        <Login />
                    </PublicRoute>
                    <PublicRoute exact path="/register">
                        <Register />
                    </PublicRoute>
                </Layout>
            </Layout>
        </div>
    )

    return (
        <div>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/product-detail/:id">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/cart">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/contact">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/maps">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/login">
                        <LoginContainer />
                    </Route>
                    <Route exact path="/register">
                        <LoginContainer />
                    </Route>
                    <Route exact path="/bookMark-management">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/home">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/profile">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/final-pay">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/room-management">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/room-type-management">
                        <PrivateContainer />
                    </Route>
                    <Route exact path="/product-list/:id">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/news">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/news/:id">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/reset-password/:id">
                        <PublicContainer />
                    </Route>
                    <Route exact path="/profile-rooms/:id">
                        <PublicContainer />
                    </Route>
                   
                    <Route exact path="/change-password/:id">
                        <PrivateContainer />
                    </Route>
                    <Route>
                        <NotFound />
                    </Route>
                </Switch>
            </Router>
        </div>
    )
})

export default RouterURL;
