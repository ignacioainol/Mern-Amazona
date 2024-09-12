import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, orders: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;

    }
}

export const OrderListScreen = () => {

    const navigate = useNavigate();


    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/orders`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
        }

        fetchData()
    }, [userInfo])

    return (
        <div>
            <Helmet>
                <title>Ordenes</title>
            </Helmet>

            <h1>Ordenes</h1>

            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className='table'>
                    <thead>
                        <th>ID</th>
                        <th>USUARIO</th>
                        <th>FECHA</th>
                        <th>TOTAL</th>
                        <th>PAGADO</th>
                        <th>ENVIADO</th>
                        <th>ACCIONES</th>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.user ? order.user.name : 'USUARIO ELIMINADO'}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>{order.totalPrice.toFixed(2)}</td>
                                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                                <td>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            navigate(`/order/${order._id}`)
                                        }}
                                    >
                                        Detalle
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    )
}
