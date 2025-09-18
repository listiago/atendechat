import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

export interface IConnections {
  source: string;
  sourceHandle: null | string;
  target: string;
  targetHandle: null | string;
  id: string;
}

export interface INodes {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    sec?: string;
    message?: string;
    arrayOption?: Array<{ number: number; value: string }>;
    typebotIntegration?: any;
  };
  type: string;
  style: { backgroundColor: string; color: string };
  width: number;
  height: number;
  selected: boolean;
  positionAbsolute: { x: number; y: number };
  dragging: boolean;
}

interface IFlowData {
  nodes: INodes[];
  connections: IConnections[];
}

@Table({
  tableName: "FlowBuilders"
})
export class FlowBuilderModel extends Model<FlowBuilderModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  user_id: number;

  @Column
  name: string;

  @Column
  company_id: number;

  @Column
  active: boolean;

  @Column(DataType.JSON)
  flow: IFlowData | null;

  @Column(DataType.JSON)
  variables: {} | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
