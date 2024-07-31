/**
 * routeRole.js
 * @description :: sequelize model of database table routeRole
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let RouteRole = sequelize.define('routeRole',{
  routeId:{
    type:DataTypes.INTEGER,
    allowNull:false
  },
  roleId:{ type:DataTypes.INTEGER },
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
      async function (routeRole,options){
        routeRole.isActive = true;
        routeRole.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (routeRole,options){
        if (routeRole !== undefined && routeRole.length) { 
          for (let index = 0; index < routeRole.length; index++) { 
        
            const element = routeRole[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
RouteRole.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(RouteRole);
sequelizePaginate.paginate(RouteRole);
module.exports = RouteRole;
