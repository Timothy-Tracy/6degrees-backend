const express = require('express');
const { catchAsync } = require('../../../../lib/error/customErrors');
const router = express.Router();
const apiRoot = '/api/search';

const SearchService = require('../../domain/SearchService.js')

router.post('/users/:prefix',
    catchAsync(SearchService.searchWithAutocompleteMiddleware),
    async function (req,res){
        res.status(200).json(res.result)
    }
)
module.exports = { apiRoot, router };