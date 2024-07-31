/**
 * Chat_messageController.js
 * @description :: exports action methods for Chat_message.
 */

const Chat_message = require('../../model/Chat_message');
const Chat_messageSchemaKey = require('../../utils/validation/Chat_messageValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Chat_message in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Chat_message. {status, message, data}
 */ 
const addChat_message = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      Chat_messageSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdChat_message = await dbService.createOne(Chat_message,dataToCreate);
    return  res.success({ data :createdChat_message });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Chat_message in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Chat_messages. {status, message, data}
 */
const bulkInsertChat_message = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdChat_message = await dbService.createMany(Chat_message,dataToCreate); 
      return  res.success({ data :{ count :createdChat_message.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Chat_message from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Chat_message(s). {status, message, data}
 */
const findAllChat_message = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundChat_message;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      Chat_messageSchemaKey.findFilterKeys,
      Chat_message.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundChat_message = await dbService.count(Chat_message, query);
      if (!foundChat_message) {
        return res.recordNotFound();
      } 
      foundChat_message = { totalRecords: foundChat_message };
      return res.success({ data :foundChat_message });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundChat_message = await dbService.paginate( Chat_message,query,options);
    if (!foundChat_message){
      return res.recordNotFound();
    }
    return res.success({ data:foundChat_message }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Chat_message from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Chat_message. {status, message, data}
 */
const getChat_message = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundChat_message = await dbService.findOne(Chat_message,{ id :id });
    if (!foundChat_message){
      return res.recordNotFound();
    }
    return  res.success({ data :foundChat_message });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Chat_message.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getChat_messageCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      Chat_messageSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedChat_message = await dbService.count(Chat_message,where);
    if (!countedChat_message){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedChat_message } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Chat_message with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Chat_message.
 * @return {Object} : updated Chat_message. {status, message, data}
 */
const updateChat_message = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body || {} };
    let query = {};
    delete dataToUpdate.addedBy;
    if (!req.params || !req.params.id) {
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }          
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      Chat_messageSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedChat_message = await dbService.update(Chat_message,query,dataToUpdate);
    return  res.success({ data :updatedChat_message }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Chat_message with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Chat_messages.
 * @return {Object} : updated Chat_messages. {status, message, data}
 */
const bulkUpdateChat_message = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedChat_message = await dbService.update(Chat_message,filter,dataToUpdate);
    if (!updatedChat_message){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedChat_message.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Chat_message with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Chat_message.
 * @return {Object} : updated Chat_message. {status, message, data}
 */
const partialUpdateChat_message = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      Chat_messageSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedChat_message = await dbService.update(Chat_message, query, dataToUpdate);
    if (!updatedChat_message) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedChat_message });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Chat_message from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Chat_message.
 * @return {Object} : deactivated Chat_message. {status, message, data}
 */
const softDeleteChat_message = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Chat_message, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Chat_message from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Chat_message. {status, message, data}
 */
const deleteChat_message = async (req, res) => {
  const result = await dbService.deleteByPk(Chat_message, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Chat_message in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyChat_message = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedChat_message = await dbService.destroy(Chat_message,query);
    return res.success({ data :{ count :deletedChat_message.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Chat_message from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Chat_message.
 * @return {Object} : number of deactivated documents of Chat_message. {status, message, data}
 */
const softDeleteManyChat_message = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids){
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }
    const query = { id:{ $in:ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    const options = {};
    let updatedChat_message = await dbService.update(Chat_message,query,updateBody, options);
    if (!updatedChat_message) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedChat_message.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addChat_message,
  bulkInsertChat_message,
  findAllChat_message,
  getChat_message,
  getChat_messageCount,
  updateChat_message,
  bulkUpdateChat_message,
  partialUpdateChat_message,
  softDeleteChat_message,
  deleteChat_message,
  deleteManyChat_message,
  softDeleteManyChat_message,
};
