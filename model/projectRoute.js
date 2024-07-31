/**
 * projectRoute.js
 * @description :: sequelize model of database table projectRoute
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let ProjectRoute = sequelize.define('projectRoute',{
  route_name:{
    type:DataTypes.STRING,
    allowNull:false
  },
  method:{
    type:DataTypes.STRING,
    allowNull:false
  },
  uri:{
    type:DataTypes.STRING,
    allowNull:false
  },
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
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
      async function (projectRoute,options){
        projectRoute.isActive = true;
        projectRoute.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (projectRoute,options){
        if (projectRoute !== undefined && projectRoute.length) { 
          for (let index = 0; index < projectRoute.length; index++) { 
        
            const element = projectRoute[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
ProjectRoute.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(ProjectRoute);
sequelizePaginate.paginate(ProjectRoute);
module.exports = ProjectRoute;
