"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "../store/models/request/users-request";
import {
  createUserSchema,
  updateUserSchema,
  UserFormData,
} from "../store/models/schema/user.schema";
import {
  fetchUserByIdService,
  createUserService,
  updateUserService,
} from "../store/thunks/users-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { clearError, clearSelectedUser } from "../store/slice/users-slice";
import {
  selectError,
  selectOperations,
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getArrayFieldError } from "@/utils/common/get-field-error";
import { AccountStatus, ModalMode } from "@/constants/status/status";
import { USER_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  userId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function UsersModal({ isOpen, onClose, userId, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const userData = useAppSelector(selectSelectedUser);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isCreate ? createUserSchema : updateUserSchema,
    ) as any,
    defaultValues: {
      id: "",
      userIdentifier: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      accountStatus: AccountStatus.ACTIVE,
      role: "",
    },
    mode: "onChange",
  });

  const userIdentifier = watch("userIdentifier");
  const email = watch("email");

  // Fetch user data for edit mode
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchUserByIdService(userId));

        if (fetchUserByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phoneNumber: data.phoneNumber || "",
            accountStatus: data.accountStatus,
            role: data.role || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        userIdentifier: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        password: "",
        role: "",
        accountStatus: AccountStatus.ACTIVE,
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isCreate) {
        const payload: CreateUserRequest = {
          userIdentifier: data.userIdentifier!,
          email: data?.email || "",
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          accountStatus: data.accountStatus,
          role: data.role,
        };

        const result = await dispatch(createUserService(payload)).unwrap();

        showToast.success(
          `User "${
            result.userIdentifier || result.email
          }" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateUserRequest = {
          firstName: data.firstName,
          email: data?.email || "",
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          accountStatus: data.accountStatus,
          role: data.role,
        };

        const result = await dispatch(
          updateUserService({ userId: data.id, userData: payload }),
        ).unwrap();

        showToast.success(
          `User "${result.fullName || result.email}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} user`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedUser());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New User" : "Edit User"}
          description={
            isCreate
              ? "Fill out the form to create a new user account"
              : "Update user information below"
          }
          avatarName={userIdentifier || email}
          avatarImageUrl={userData?.profileImageUrl}
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              {/* Changed: grid-cols-2 (always 2 columns, no responsive) */}
              <div className="grid grid-cols-2 gap-4">
                {isCreate && (
                  <>
                    <TextField
                      control={control}
                      name="userIdentifier"
                      label="User Identifier"
                      placeholder="Enter user identifier"
                      required
                      disabled={isSubmitting}
                      error={errors.userIdentifier}
                    />

                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      required
                      disabled={isSubmitting}
                      error={errors.email}
                    />
                  </>
                )}

                <TextField
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  disabled={isSubmitting}
                  error={errors.firstName}
                />

                <TextField
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  disabled={isSubmitting}
                  error={errors.lastName}
                />

                <TextField
                  control={control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                  error={errors.phoneNumber}
                />

                {isCreate && (
                  <PasswordField
                    control={control}
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    error={errors.password}
                  />
                )}

                <SelectField
                  control={control}
                  name="role"
                  label="User Role"
                  placeholder="Select user role"
                  options={USER_CREATE_UPDATE}
                  required
                  disabled={isSubmitting}
                  error={getArrayFieldError(errors.role)}
                  onValueChange={(value) => {
                    setValue("role", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating user..."
              updateMessage="Updating user..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create User"
                updateText="Update User"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
