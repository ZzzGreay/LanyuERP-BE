/**********************/
/* DingDing provided  */
/**********************/
// 人员
Person {
	personId: String,
	name: String,
}



/****************/
/* Fundamental  */
/****************/

// 仪器
Machine {
	machineId: String,
	location: Location,
	// 零件
	parts: List<Part>
}

// 地址
Location {
	address: String,
	name: String
}

// 零件
Part {
	type: PartType,
	location: Location
	state: PartState

}

// 零件类型
enum PartType {
	name: String,
	price: Integer,
}

// 零件状态
enum PartState {
	IN_USE,
	REPORTED_BROKEN,
	PENDING_INSPECTION,
}

/****************/
/* Maintenance  */
/****************/

// 维护工作记录
WorkOrder {
	machineId: String,
	// 记录者
	recorderId: String 
	efforts: List {
		personId: String, // worker's id
		startTime: Long, // epoch millis
		endTime: Long, // epoch millis
	},
	// 出勤交通	
	transportation: {
		carId: String,
		startKilometres: long,
		endKilometres: long,
	}

}

// 工作付出时间
WorkEffort {
	
}



