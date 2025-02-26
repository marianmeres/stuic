let _id = 0;

export function getId(prefix: string = "id-") {
	return `${prefix}${++_id}`;
}
