import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Card, Badge, Button } from 'react-bootstrap';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { currency, getError } from '../utils';
import { Store } from '../Store';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, product: action.payload, loading: false }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        default:
            return state;
    }
}

export const ProductScreen = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { slug } = params;

    const [{ loading, error, product }, dispatch] = useReducer(reducer, {
        product: [],
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });

            try {
                const result = await axios.get(`/api/products/slug/${slug}`);
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
        }
        fetchData();
    }, [slug]);

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart } = state;
    const addToCartHandler = async () => {
        const existItem = cart.cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/${product._id}`);
        if (data.countInStock < quantity) {
            window.alert("Sorry. Product is out of stock");
            return;
        }

        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...product, quantity }
        });
        navigate('/cart')
    }

    return (
        loading ? (<LoadingBox />) :
            error ? (
                <MessageBox variant="danger">{error}</MessageBox>)
                :
                (
                    <div>
                        <Row>
                            <Col md={6}>
                                <img
                                    src={product.image}
                                    className="img-large"
                                    alt={product.name} />
                            </Col>
                            <Col md={3}>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <Helmet>
                                            <title>{product.name}</title>
                                        </Helmet>
                                        <h1>{product.name}</h1>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Rating
                                            rating={product.rating}
                                            numReviews={product.numReviews}
                                        >
                                        </Rating>
                                    </ListGroup.Item>
                                    <ListGroup.Item>Precio: {currency(product.price)}</ListGroup.Item>
                                    <ListGroup.Item>
                                        Descripción:
                                        <p>{product.description}</p>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={3}>
                                <Card>
                                    <Card.Body>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item>
                                                <Row>
                                                    <Col>Precio</Col>
                                                    <Col>{currency(product.price)}</Col>
                                                </Row>
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <Row>
                                                    <Col>Status</Col>
                                                    <Col>
                                                        {product.countInStock > 0 ?
                                                            <Badge bg="success">In Stock</Badge>
                                                            : <Badge bg="danger">Unavailable</Badge>
                                                        }
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>

                                            {product.countInStock > 0 && (
                                                <div className="d-grid">
                                                    <Button onClick={addToCartHandler} variant="primary">
                                                        Añadir al Carro
                                                    </Button>
                                                </div>
                                            )}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )
    )
}
