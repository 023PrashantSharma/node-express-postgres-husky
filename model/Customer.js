/**
 * Customer.js
 * @description :: sequelize model of database table Customer
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let Customer = sequelize.define('Customer',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  firstName:{ type:DataTypes.STRING },
  lastName:{ type:DataTypes.STRING },
  profile:{ type:DataTypes.STRING },
  contactNumber:{ type:DataTypes.STRING },
  email:{ type:DataTypes.STRING },
  isActive:{ type:DataTypes.BOOLEAN },
  createdAt:{ type:DataTypes.DATE },
  updatedAt:{ type:DataTypes.DATE },
  addedBy:{ type:DataTypes.INTEGER },
  updatedBy:{ type:DataTypes.INTEGER },
  isDeleted:{ type:DataTypes.BOOLEAN }
}
,{
  hooks:{
    beforeCreate: [
      async function (Customer,options){
        user.name = `${user.firstName}, ${user.lastName}`;
      },
      async function (Customer,options){
        Customer.isActive = true;
        Customer.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (Customer,options){
        if (Customer !== undefined && Customer.length) { 
          for (let index = 0; index < Customer.length; index++) { 
        
            const element = Customer[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
  ,indexes:  [{
    'using':'BTREE',
    'fields':[{
      'attribute':'firstName',
      'order':'ASC',
      'length':10,
      'operator':'',
      'value':''
    }],
    'name':'Customer_index_firstName_index_1'
  },{
    'using':'BTREE',
    'fields':[{
      'attribute':'lastName',
      'order':'ASC',
      'length':10,
      'operator':'',
      'value':''
    }],
    'name':'Customer_index_lastName_index_2'
  }]
}
);
Customer.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(Customer);
sequelizePaginate.paginate(Customer);
module.exports = Customer;
