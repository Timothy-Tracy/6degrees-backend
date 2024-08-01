const SearchRepository = require('../data-access/SearchRepository');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'SearchService' });
async function searchWithAutocomplete(prefix){
    const log = logger.child({'function': 'searchWithAutocomplete'});
    log.trace(prefix);
    const result = await SearchRepository.autocompleteSearch({label: 'USER', property:'username', prefix:prefix})
    return result;
}

async function searchWithAutocompleteMiddleware(req,res,next){
    const log = logger.child({'function': 'searchWithAutocomplete'});
    log.trace();
    res.result = await searchWithAutocomplete(req.params.prefix)
    next()
}

module.exports = {searchWithAutocomplete,searchWithAutocompleteMiddleware}