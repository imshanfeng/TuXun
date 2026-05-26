package com.yupi.yupicture.infrastructure.api;

import cn.hutool.core.io.FileUtil;
import com.aliyun.oss.OSS;
import com.aliyun.oss.model.OSSObject;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectRequest;
import com.yupi.yupicture.infrastructure.config.OssClientConfig;
import com.yupi.yupicture.infrastructure.manager.upload.model.dto.file.OssPutResult;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;

@Component
public class OssManager {

    @Resource
    private OssClientConfig ossClientConfig;

    @Resource
    private OSS ossClient;

    /**
     * 上传对象
     *
     * @param key  唯一键
     * @param file 文件
     */
    public void putObject(String key, File file) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setHeader("x-oss-object-acl", "public-read");
        PutObjectRequest putObjectRequest = new PutObjectRequest(ossClientConfig.getBucket(), key, file);
        putObjectRequest.setMetadata(metadata);
        ossClient.putObject(putObjectRequest);
    }

    /**
     * 下载对象
     *
     * @param key 唯一键
     */
    public OSSObject getObject(String key) {
        return ossClient.getObject(ossClientConfig.getBucket(), key);
    }

    /**
     * 上传图片（本地处理：压缩为 WebP、生成缩略图、提取图片信息）
     *
     * @param key  唯一键
     * @param file 文件
     */
    public OssPutResult putPictureObject(String key, File file) {
        OssPutResult result = new OssPutResult();
        result.setOriginalKey(key);
        try {
            // 读取原图信息
            BufferedImage originalImage = ImageIO.read(file);
            if (originalImage == null) {
                throw new RuntimeException("无法读取图片");
            }
            int width = originalImage.getWidth();
            int height = originalImage.getHeight();
            String format = FileUtil.getSuffix(key);
            result.setWidth(width);
            result.setHeight(height);
            result.setFormat(format);
            // 计算主色调
            result.setAve(calcAverageColor(originalImage));

            // 1. 上传原图
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setHeader("x-oss-object-acl", "public-read");
            PutObjectRequest originalRequest = new PutObjectRequest(ossClientConfig.getBucket(), key, file);
            originalRequest.setMetadata(metadata);
            ossClient.putObject(originalRequest);

            // 2. 压缩为 WebP 格式上传
            String webpKey = FileUtil.mainName(key) + ".webp";
            try {
                File webpFile = File.createTempFile("webp_", ".webp");
                try {
                    Thumbnails.of(originalImage)
                            .size(width, height)
                            .outputFormat("webp")
                            .outputQuality(0.8)
                            .toFile(webpFile);
                    PutObjectRequest webpRequest = new PutObjectRequest(ossClientConfig.getBucket(), webpKey, webpFile);
                    webpRequest.setMetadata(metadata);
                    ossClient.putObject(webpRequest);
                    result.setCompressedKey(webpKey);
                } finally {
                    FileUtil.del(webpFile);
                }
            } catch (Exception e) {
                // WebP 转换失败时，使用原图作为压缩图
                result.setCompressedKey(key);
            }

            // 3. 缩略图处理，仅对 > 2KB 的图片生成缩略图
            if (file.length() > 2 * 1024) {
                String thumbnailKey = FileUtil.mainName(key) + "_thumbnail." + format;
                File thumbnailFile = File.createTempFile("thumb_", "." + format);
                try {
                    Thumbnails.of(originalImage)
                            .size(256, 256)
                            .keepAspectRatio(true)
                            .outputQuality(0.8)
                            .toFile(thumbnailFile);
                    PutObjectRequest thumbnailRequest = new PutObjectRequest(ossClientConfig.getBucket(), thumbnailKey, thumbnailFile);
                    thumbnailRequest.setMetadata(metadata);
                    ossClient.putObject(thumbnailRequest);
                    result.setThumbnailKey(thumbnailKey);
                } finally {
                    FileUtil.del(thumbnailFile);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("图片处理失败", e);
        }
        return result;
    }

    /**
     * 删除对象
     *
     * @param key 唯一键
     */
    public void deleteObject(String key) {
        ossClient.deleteObject(ossClientConfig.getBucket(), key);
    }

    /**
     * 计算图片主色调（平均颜色）
     */
    private String calcAverageColor(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        long totalR = 0, totalG = 0, totalB = 0;
        int pixelCount = width * height;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                Color color = new Color(image.getRGB(x, y));
                totalR += color.getRed();
                totalG += color.getGreen();
                totalB += color.getBlue();
            }
        }
        int avgR = (int) (totalR / pixelCount);
        int avgG = (int) (totalG / pixelCount);
        int avgB = (int) (totalB / pixelCount);
        return String.format("#%02x%02x%02x", avgR, avgG, avgB);
    }
}
