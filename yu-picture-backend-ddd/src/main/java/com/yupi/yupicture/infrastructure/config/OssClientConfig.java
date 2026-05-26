package com.yupi.yupicture.infrastructure.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "oss.client")
@Data
public class OssClientConfig {

    /**
     * 域名
     */
    private String host;

    /**
     * 端点
     */
    private String endpoint;

    /**
     * accessKeyId
     */
    private String accessKeyId;

    /**
     * 密钥（注意不要泄露）
     */
    private String accessKeySecret;

    /**
     * 桶名
     */
    private String bucket;

    @Bean
    public OSS ossClient() {
        return new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
    }
}
