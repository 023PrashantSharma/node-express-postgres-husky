/**
 * departmentsController.js
 * @description :: exports action methods for departments.
 */

const Departments = require('../../model/departments');
const departmentsSchemaKey = require('../../utils/validation/departmentsValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Departments in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Departments. {status, message, data}
 */ 
const addDepartments = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      departmentsSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Departments,[ 'name', 'code', 'email' ],dataToCreate,'INSERT');
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let createdDepartments = await dbService.createOne(Departments,dataToCreate);
    return  res.success({ data :createdDepartments });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Departments in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Departmentss. {status, message, data}
 */
const bulkInsertDepartments = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Departments,[ 'name', 'code', 'email' ],dataToCreate,'BULK_INSERT');
      if (checkUniqueFields.isDuplicate){
        return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
      }
      let createdDepartments = await dbService.createMany(Departments,dataToCreate); 
      return  res.success({ data :{ count :createdDepartments.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Departments from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Departments(s). {status, message, data}
 */
const findAllDepartments = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundDepartments;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      departmentsSchemaKey.findFilterKeys,
      Departments.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundDepartments = await dbService.count(Departments, query);
      if (!foundDepartments) {
        return res.recordNotFound();
      } 
      foundDepartments = { totalRecords: foundDepartments };
      return res.success({ data :foundDepartments });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundDepartments = await dbService.paginate( Departments,query,options);
    if (!foundDepartments){
      return res.recordNotFound();
    }
    return res.success({ data:foundDepartments }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Departments from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Departments. {status, message, data}
 */
const getDepartments = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundDepartments = await dbService.findOne(Departments,{ id :id });
    if (!foundDepartments){
      return res.recordNotFound();
    }
    return  res.success({ data :foundDepartments });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Departments.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getDepartmentsCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      departmentsSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedDepartments = await dbService.count(Departments,where);
    if (!countedDepartments){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedDepartments } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Departments with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Departments.
 * @return {Object} : updated Departments. {status, message, data}
 */
const updateDepartments = async (req, res) => {
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
      departmentsSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Departments,[ 'name', 'code', 'email' ],dataToUpdate,'UPDATE', query);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedDepartments = await dbService.update(Departments,query,dataToUpdate);
    return  res.success({ data :updatedDepartments }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Departments with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Departmentss.
 * @return {Object} : updated Departmentss. {status, message, data}
 */
const bulkUpdateDepartments = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Departments,[ 'name', 'code', 'email' ],dataToUpdate,'BULK_UPDATE', filter);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedDepartments = await dbService.update(Departments,filter,dataToUpdate);
    if (!updatedDepartments){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedDepartments.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Departments with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Departments.
 * @return {Object} : updated Departments. {status, message, data}
 */
const partialUpdateDepartments = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      departmentsSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Departments,[ 'name', 'code', 'email' ],dataToUpdate,'UPDATE', query);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedDepartments = await dbService.update(Departments, query, dataToUpdate);
    if (!updatedDepartments) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedDepartments });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Departments from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Departments.
 * @return {Object} : deactivated Departments. {status, message, data}
 */
const softDeleteDepartments = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Departments, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Departments from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Departments. {status, message, data}
 */
const deleteDepartments = async (req, res) => {
  const result = await dbService.deleteByPk(Departments, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Departments in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyDepartments = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedDepartments = await dbService.destroy(Departments,query);
    return res.success({ data :{ count :deletedDepartments.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Departments from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Departments.
 * @return {Object} : number of deactivated documents of Departments. {status, message, data}
 */
const softDeleteManyDepartments = async (req, res) => {
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
    let updatedDepartments = await dbService.update(Departments,query,updateBody, options);
    if (!updatedDepartments) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedDepartments.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addDepartments,
  bulkInsertDepartments,
  findAllDepartments,
  getDepartments,
  getDepartmentsCount,
  updateDepartments,
  bulkUpdateDepartments,
  partialUpdateDepartments,
  softDeleteDepartments,
  deleteDepartments,
  deleteManyDepartments,
  softDeleteManyDepartments,
};
