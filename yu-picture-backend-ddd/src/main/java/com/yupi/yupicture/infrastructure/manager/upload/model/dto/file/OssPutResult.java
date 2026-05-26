package com.yupi.yupicture.infrastructure.manager.upload.model.dto.file;

import lombok.Data;

/**
 * OSS 上传结果
 */
@Data
public class OssPutResult {

    /**
     * 原图 key
     */
    private String originalKey;

    /**
     * 压缩图 key（WebP 格式）
     */
    private String compressedKey;

    /**
     * 缩略图 key
     */
    private String thumbnailKey;

    /**
     * 图片宽度
     */
    private int width;

    /**
     * 图片高度
     */
    private int height;

    /**
     * 图片格式
     */
    private String format;

    /**
     * 图片主色调
     */
    private String ave;
}
