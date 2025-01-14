import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { getError } from '../utils';
import { Store } from '../Store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false
            }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreate: false };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };

        case 'DELETE_PRODUCT_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_PRODUCT_SUCCESS':
            return {
                ...state,
                loadingDelete: false,
                successDelete: true
            };
        case 'DELETE_PRODUCT_FAIL':
            return { ...state, loadingDelete: false, successDelete: false }
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false }
        default:
            return state;
    }
}

export const ProductListScreen = () => {

    const [{ loading, error, products, pages, loadingCreate, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;
    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`/api/products/admin?page=${page}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
        }
        fetchData();
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' })
        } else {
            fetchData();
        }
    }, [page, userInfo, successDelete]);

    const createHandler = async () => {
        if (window.confirm('Estas seguro de crear éste producto?')) {

            try {
                dispatch({ type: 'CREATE_REQUEST' });
                const { data } = await axios.post(
                    '/api/products',
                    {},
                    {
                        headers: { Authorization: `Beaber ${userInfo.token}` }
                    }
                );
                toast.success('Producto creado con éxito!');
                dispatch({ type: 'CREATE_SUCCESS' });
                navigate(`/admin/product/${data.product._id}`)

            } catch (error) {
                toast.error(getError(error));
                dispatch({ type: 'CREATE_ERROR' });
            }
        }
    }

    const deleteHandler = async (productId) => {
        if (window.confirm('Estas seguro de eliminar éste producto?')) {
            try {
                dispatch({ type: 'DELETE_PRODUCT_REQUEST' });
                await axios.delete(`/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                toast.success('Producto eliminado con éxito!');
                dispatch({ type: 'DELETE_PRODUCT_SUCCESS' });


            } catch (error) {
                toast.error(getError(error));

                dispatch({ type: 'DELETE_PRODUCT_FAIL' });
            }
        }
    }


    return (
        <div>
            <Row>
                <Col>
                    <h1>Productos</h1>
                </Col>
                <Col className='col text-end'>
                    <div>
                        <Button type="button" onClick={createHandler} >
                            Crear Producto
                        </Button>
                    </div>
                </Col>
            </Row>

            {loadingCreate && <LoadingBox />}
            {loadingDelete && <LoadingBox />}

            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) :
                <>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NOMBRE</th>
                                <th>PRECIO</th>
                                <th>CATEGORÍA</th>
                                <th>MARCA</th>
                                <th>ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>
                                    <td>
                                        <Button
                                            type="button"
                                            variant="success"
                                            onClick={() => navigate(`/admin/product/${product._id}`)}
                                        >
                                            Editar
                                        </Button>
                                        {'  '}
                                        <Button
                                            type="button"
                                            variant="danger"
                                            onClick={() => deleteHandler(product._id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                                key={x + 1}
                                to={`/admin/products?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>

            }
        </div>
    )
}
