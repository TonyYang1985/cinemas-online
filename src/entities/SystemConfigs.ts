import { Column, Entity } from "typeorm";

@Entity("system_configs", { schema: "fotNet" })
export class SystemConfigs {
  @Column("varchar", { primary: true, name: "id", length: 10 })
  id: string;

  @Column("varchar", { name: "scope", length: 255 })
  scope: string;

  @Column("varchar", { name: "config_name", length: 255 })
  configName: string;

  @Column("longtext", { name: "config_value" })
  configValue: string;

  @Column("int", { name: "enabled" })
  enabled: number;

  constructor(init?: Partial<SystemConfigs>) {
    Object.assign(this, init);
  }
}
