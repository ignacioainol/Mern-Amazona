import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { currency, isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
    let products = await Product.find();

    // const productCurrency = products.map(product => {
    //     return {
    //         ...product.toJSON(),
    //         price: currency(product.price)
    //     };
    // })


    res.send(products);
});

productRouter.delete('/:id', isAuth, isAdmin,

    expressAsyncHandler(
        async (req, res) => {
            const productId = req.params.id;
            const product = await Product.findById(productId);

            if (product) {
                res.send(`llego aca :D eliminar producto ${productId}`);
                await product.remove();
                res.send({ message: 'Producto Eliminado' });

            } else {
                res.status(404).send({ message: 'Producto no encontrado' });
            }
        })
);

const PAGE_SIZE = 5;

productRouter.get('/admin',
    isAuth, isAdmin,
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const products = await Product.find()
            .skip(pageSize * (page - 1))
            .limit(pageSize);
        const countProducts = await Product.countDocuments();
        res.send({
            products,
            countProducts,
            page,
            pages: Math.ceil(countProducts / pageSize)
        });
    })
);

productRouter.put('/:id',
    isAuth, isAdmin,
    expressAsyncHandler(async (req, res) => {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (product) {
            product.name = req.body.name;
            product.slug = req.body.slug;
            product.price = req.body.price;
            product.image = req.body.image;
            product.category = req.body.category;
            product.brand = req.body.brand;
            product.countInStock = req.body.countInStock;
            product.description = req.body.description;
            await product.save();
            res.send({ message: 'Producto Actualizado' });
        } else {
            res.status(404).send({ message: 'Producto no encontrado' });
        }
    })
)

productRouter.post('/',
    isAuth, isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newProduct = new Product({
            name: `sample name ${Date.now()}`,
            slug: `sample-name- ${Date.now()}`,
            image: '/images/p1.jpg',
            price: 0,
            category: 'sample category',
            brand: 'sample brand',
            description: 'description test',
            countInStock: 0,
            rating: 0,
            numReviews: 0
        });

        const product = await newProduct.save();
        res.send({ message: 'Producto Creado', product });
    })
)

productRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const pageSize = query.pageSize || PAGE_SIZE;
        const page = query.page || 1;
        const category = query.category || '';
        const price = query.price || '';
        const rating = query.rating || '';
        const order = query.order || '';
        const searchQuery = query.query || '';

        const queryFilter =
            searchQuery && searchQuery !== 'all'
                ? {
                    name: {
                        $regex: searchQuery,
                        $options: 'i',
                    },
                }
                : {};
        const categoryFilter = category && category !== 'all' ? { category } : {};
        const ratingFilter =
            rating && rating !== 'all'
                ? {
                    rating: {
                        $gte: Number(rating),
                    },
                }
                : {};
        const priceFilter =
            price && price !== 'all'
                ? {
                    // 1-50
                    price: {
                        $gte: Number(price.split('-')[0]),
                        $lte: Number(price.split('-')[1]),
                    },
                }
                : {};
        const sortOrder =
            order === 'featured'
                ? { featured: -1 }
                : order === 'lowest'
                    ? { price: 1 }
                    : order === 'highest'
                        ? { price: -1 }
                        : order === 'toprated'
                            ? { rating: -1 }
                            : order === 'newest'
                                ? { createdAt: -1 }
                                : { _id: -1 };

        const products = await Product.find({
            ...queryFilter,
            ...categoryFilter,
            ...priceFilter,
            ...ratingFilter,
        })
            .sort(sortOrder)
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countProducts = await Product.countDocuments({
            ...queryFilter,
            ...categoryFilter,
            ...priceFilter,
            ...ratingFilter,
        });
        res.send({
            products,
            countProducts,
            page,
            pages: Math.ceil(countProducts / pageSize),
        });
    })
);

productRouter.get(`/categories`, expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
}));

productRouter.get('/slug/:slug', async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
        res.send(product);
    } else {
        res.status(400).send({
            message: 'Product doesn\'t exists'
        });
    }
});

productRouter.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(400).send({
            message: 'Product doesn\'t exists'
        });
    }
});


export default productRouter;