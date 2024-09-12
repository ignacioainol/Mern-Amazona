export const getError = (error) => {
    return error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
}

export const currency = function (number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(number);
};