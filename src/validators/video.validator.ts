import Joi from 'joi';

export const createVideoSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '视频标题不能为空',
    'string.min': '视频标题至少1个字符',
    'string.max': '视频标题最多200个字符',
    'any.required': '视频标题是必填项',
  }),
  description: Joi.string().max(2000).optional().allow('').messages({
    'string.max': '视频描述最多2000个字符',
  }),
  category_id: Joi.string().uuid().required().messages({
    'string.guid': '分类ID格式不正确',
    'any.required': '分类ID是必填项',
  }),
  video_url: Joi.string().uri().required().messages({
    'string.uri': '视频URL格式不正确',
    'any.required': '视频URL是必填项',
  }),
  cover_image: Joi.string().uri().optional().messages({
    'string.uri': '封面图片URL格式不正确',
  }),
  duration: Joi.number().integer().min(0).optional().messages({
    'number.base': '视频时长必须是数字',
    'number.integer': '视频时长必须是整数',
    'number.min': '视频时长不能为负数',
  }),
  resolution: Joi.string().max(20).optional().messages({
    'string.max': '分辨率最多20个字符',
  }),
  file_size: Joi.number().integer().min(0).optional().messages({
    'number.base': '文件大小必须是数字',
    'number.integer': '文件大小必须是整数',
    'number.min': '文件大小不能为负数',
  }),
  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': '标签必须是数组',
  }),
  maccms_vod_id: Joi.string().max(50).optional().messages({
    'string.max': 'MacCMS视频ID最多50个字符',
  }),
  maccms_data: Joi.object().optional(),
});

export const updateVideoSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.empty': '视频标题不能为空',
    'string.min': '视频标题至少1个字符',
    'string.max': '视频标题最多200个字符',
  }),
  description: Joi.string().max(2000).optional().allow('').messages({
    'string.max': '视频描述最多2000个字符',
  }),
  category_id: Joi.string().uuid().optional().messages({
    'string.guid': '分类ID格式不正确',
  }),
  video_url: Joi.string().uri().optional().messages({
    'string.uri': '视频URL格式不正确',
  }),
  cover_image: Joi.string().uri().optional().allow('').messages({
    'string.uri': '封面图片URL格式不正确',
  }),
  duration: Joi.number().integer().min(0).optional().messages({
    'number.base': '视频时长必须是数字',
    'number.integer': '视频时长必须是整数',
    'number.min': '视频时长不能为负数',
  }),
  resolution: Joi.string().max(20).optional().messages({
    'string.max': '分辨率最多20个字符',
  }),
  file_size: Joi.number().integer().min(0).optional().messages({
    'number.base': '文件大小必须是数字',
    'number.integer': '文件大小必须是整数',
    'number.min': '文件大小不能为负数',
  }),
  status: Joi.string().valid('draft', 'published', 'archived').optional().messages({
    'any.only': '状态必须是 draft、published 或 archived',
  }),
  is_featured: Joi.boolean().optional().messages({
    'boolean.base': '推荐标识必须是布尔值',
  }),
  tags: Joi.array().items(Joi.string()).optional().messages({
    'array.base': '标签必须是数组',
  }),
  maccms_data: Joi.object().optional(),
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段',
});

export const rateVideoSchema = Joi.object({
  rating: Joi.number().min(0).max(10).required().messages({
    'number.base': '评分必须是数字',
    'number.min': '评分不能小于0',
    'number.max': '评分不能大于10',
    'any.required': '评分是必填项',
  }),
});

export const videoListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.min': '页码不能小于1',
  }),
  pageSize: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.integer': '每页数量必须是整数',
    'number.min': '每页数量不能小于1',
    'number.max': '每页数量不能大于100',
  }),
  category_id: Joi.string().uuid().optional().messages({
    'string.guid': '分类ID格式不正确',
  }),
  status: Joi.string().valid('draft', 'published', 'archived').optional().messages({
    'any.only': '状态必须是 draft、published 或 archived',
  }),
  is_featured: Joi.boolean().optional().messages({
    'boolean.base': '推荐标识必须是布尔值',
  }),
  search: Joi.string().max(100).optional().messages({
    'string.max': '搜索关键词最多100个字符',
  }),
  sort: Joi.string().valid('latest', 'popular', 'rating').optional().messages({
    'any.only': '排序方式必须是 latest、popular 或 rating',
  }),
});

export const searchVideosQuerySchema = Joi.object({
  keyword: Joi.string().min(1).max(100).required().messages({
    'string.empty': '搜索关键词不能为空',
    'string.min': '搜索关键词至少1个字符',
    'string.max': '搜索关键词最多100个字符',
    'any.required': '搜索关键词是必填项',
  }),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.min': '页码不能小于1',
  }),
  pageSize: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.integer': '每页数量必须是整数',
    'number.min': '每页数量不能小于1',
    'number.max': '每页数量不能大于100',
  }),
});
