import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button, Container, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store'
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: action.payload };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payload };
        default:
            return state;
    }
}

export const ProductEditScreen = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { id: productId } = params; // /product/:id
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, loadingUpdate, loadingUpload, }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/products/${productId}`);
                const { name, slug, price, image, category, countInStock, brand, description } = data;
                setName(name);
                setSlug(slug);
                setPrice(price);
                setCategory(category);
                setImage(image);
                setCountInStock(countInStock);
                setBrand(brand);
                setDescription(description);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (error) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(error)
                })
            }
        }

        fetchData();
    }, [productId])

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(
                `/api/products/${productId}`,
                {
                    _id: productId,
                    name,
                    slug,
                    price,
                    image,
                    category,
                    brand,
                    countInStock,
                    description
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            )
            dispatch({ type: 'UPDATE_SUCCESS' });
            toast.success('Producto actualizado con éxito!');
            navigate(`/admin/products`)
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'UPDATE_FAIL' });
        }
    }

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);

        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            })
            dispatch({ type: 'UPLOAD_SUCCESS', payload: data });
            toast.success('Imagen subida con éxito');
            setImage(data.secure_url);
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'UPLOAD_FAIL', payload: error.message });
        }
    }


    return (
        <Container className="smaill-container">
            <Helmet>
                <title>Editar Producto ${productId}</title>
            </Helmet>

            <h1>Editar Producto ${productId}</h1>
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3' controlId="name">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="slug">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="price">
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="image">
                        <Form.Label>Imagen</Form.Label>
                        <Form.Control
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>Upload File</Form.Label>
                        <Form.Control type="file" onChange={uploadFileHandler} />
                        {loadingUpload && <LoadingBox />}
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="category">
                        <Form.Label>Categoria</Form.Label>
                        <Form.Control
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="brand">
                        <Form.Label>Marca</Form.Label>
                        <Form.Control
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="countInStock">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="description">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        >
                        </Form.Control>
                    </Form.Group>
                    <div className="mb-3">
                        <Button
                            disabled={loadingUpdate}
                            type="submit">
                            Actualizar
                        </Button>
                        {
                            loadingUpdate && <LoadingBox />
                        }
                    </div>
                </Form>
            )

            }
        </Container>
    )
}
