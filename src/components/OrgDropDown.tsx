// Add suppressHydrationWarning to the div with popper attributes
const dynamicStyles: React.CSSProperties = {
	// Add your desired styles here, for example:
	position: 'absolute',
	zIndex: 1000,
};

<div
	data-popper-placement="bottom"
	style={dynamicStyles}
	suppressHydrationWarning={true}
>
	{/* component content */}
</div>
