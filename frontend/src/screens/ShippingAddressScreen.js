import React, { useContext, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';

export default function ShippingAddressScreen() {

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        userInfo,
        cart: { shippingAddress }
    } = state;
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || 'Chile');

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping');
        }
    }, [userInfo, navigate])


    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                city,
                postalCode,
                country
            }
        });

        localStorage.setItem('shippingAddress', JSON.stringify({
            fullName,
            address,
            city,
            postalCode,
            country
        }));
        navigate('/payment');
    }

    return (
        <div>
            <Helmet>
                <title>Dirección</title>
            </Helmet>

            <CheckoutSteps step1 step2></CheckoutSteps>

            <div className="container small-container">
                <h1 className="my-3">Dirección de Entrega</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3' controlId="fullName">
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="address">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="city">
                        <Form.Label>Ciudad</Form.Label>
                        <Form.Control
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="postalCode">
                        <Form.Label>Codigo Postal</Form.Label>
                        <Form.Control
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId="country" style={{'display': 'none'}}>
                        <Form.Label>País</Form.Label>
                        <Form.Control
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required />
                    </Form.Group>

                    <div className="mb-3">
                        <Button variant="primary" type="submit">
                            Continuar
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
