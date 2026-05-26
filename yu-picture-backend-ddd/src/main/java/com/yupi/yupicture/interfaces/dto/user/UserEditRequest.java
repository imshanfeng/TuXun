package com.yupi.yupicture.interfaces.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 编辑当前用户请求
 */
@Data
public class UserEditRequest implements Serializable {

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户头像
     */
    private String userAvatar;

    /**
     * 简介
     */
    private String userProfile;

    private static final long serialVersionUID = 1L;
}
