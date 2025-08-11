import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { Button } from 'flowbite-react';
import { Features } from '../../utils/enums/features';
import { Roles } from '../../utils/enums/roles';
import { getUserRoles } from '../../config/ecosystem'

interface RoleViewButtonProps {
	title?: string
	buttonTitle?: string,
	svgComponent?: ReactElement,
	onClickEvent?: () => void,
	feature: string,
	isOutline?: boolean,
	isPadding?: boolean,
	disabled?: boolean
}


const RoleViewButton = ({ title, buttonTitle, svgComponent, onClickEvent, feature, isOutline, isPadding, disabled }: RoleViewButtonProps) => {

	const [userRoles, setUserRoles] = useState<string[]>([])

	const getUserOrgRoles = async () => {
		const roles = await getUserRoles()
		setUserRoles(roles)
	}

	useEffect(() => {
		getUserOrgRoles()
	}, [])

	const isPlatformAdmin = (): boolean => {
		// Replace this logic with your actual platform admin check
		return userRoles.includes(Roles.PLATFORM_ADMIN);
	};

	const isRoleAccess = (): boolean => {
		// Use the comprehensive Features enum for better role management
		switch (feature) {
			case Features.CREATE_ORG:
				return userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN);

			case Features.ISSUANCE:
			case Features.CREATE_SCHEMA:
			case Features.BULK_ISSUANCE:
				return userRoles.includes(Roles.OWNER) ||
					userRoles.includes(Roles.ADMIN) ||
					userRoles.includes(Roles.ISSUER);

			case Features.VERIFICATION:
			case Features.REQUEST_PROOF:
				return userRoles.includes(Roles.OWNER) ||
					userRoles.includes(Roles.ADMIN) ||
					userRoles.includes(Roles.VERIFIER);

			case Features.MANAGE_MEMBERS:
			case Features.EDIT_USER_ROLES:
				return userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN);

			default:
				return userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN);
		}
	}

	return (
		<Button
			title={title}
			outline={Boolean(isOutline)}
			onClick={isRoleAccess() ? onClickEvent : null}
			color={isOutline ? "bg-primary-800" : "bg-primary-700"}
			className={`${isOutline
				? "!p-0 role-btn group flex h-min items-center justify-center text-center focus:z-10 focus:ring-2 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-md text-sm dark:text-white dark:hover:text-primary-700"
				: `${isPadding ? "!p-0" : ""} text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-md hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`
				}`}
			disabled={disabled || !isRoleAccess()}
		>
			{svgComponent}
			{buttonTitle}

		</Button>
	)

}

export default RoleViewButton
